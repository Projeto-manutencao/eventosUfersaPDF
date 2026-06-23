from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


def get_user_role(user):
    if user.is_superuser:
        return 'admin'
    return getattr(getattr(user, 'perfil', None), 'role', 'usuario')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        password = attrs['password']
        User = get_user_model()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('Credenciais invalidas.') from exc

        user = authenticate(
            request=self.context.get('request'),
            username=user.get_username(),
            password=password,
        )

        if not user:
            raise serializers.ValidationError('Credenciais invalidas.')
        if not user.is_active:
            raise serializers.ValidationError('Usuario inativo.')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField()

    def get_role(self, user):
        return get_user_role(user)

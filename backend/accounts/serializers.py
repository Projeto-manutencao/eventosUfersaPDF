from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PerfilUsuario


def get_user_role(user):
    if user.is_superuser:
        return 'admin'
    return getattr(getattr(user, 'perfil', None), 'role', 'usuario')


class BaseLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    required_role = None

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

        role = get_user_role(user)
        if self.required_role == 'admin' and role != 'admin':
            raise serializers.ValidationError('Acesso permitido apenas para administradores.')
        if self.required_role == 'usuario' and role == 'admin':
            raise serializers.ValidationError('Use a entrada de administrador.')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }


class LoginSerializer(BaseLoginSerializer):
    required_role = 'usuario'


class AdminLoginSerializer(BaseLoginSerializer):
    required_role = 'admin'


class RegisterSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        email = value.strip().lower()
        User = get_user_model()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('Este email ja esta cadastrado.')
        return email

    def create(self, validated_data):
        User = get_user_model()
        nome = validated_data.get('nome', '').strip()
        email = validated_data['email']
        username_base = email.split('@')[0]
        username = username_base
        counter = 1

        while User.objects.filter(username=username).exists():
            counter += 1
            username = f'{username_base}{counter}'

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=nome,
        )
        PerfilUsuario.objects.create(user=user, role=PerfilUsuario.Role.USUARIO)
        return user

    def to_representation(self, user):
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
      
from rest_framework.permissions import SAFE_METHODS, BasePermission, AllowAny


class IsAdminUser(BasePermission):
    message = 'Apenas administradores podem alterar eventos.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                getattr(getattr(user, 'perfil', None), 'role', None) == 'admin'
                or user.is_superuser
            )
        )


class AllowAnyReadAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return AllowAny().has_permission(request, view)
        return IsAdminUser().has_permission(request, view)

# Keepel

Keepel es un servicio para que personas particulares organicen la información de sus vehículos y su mantenimiento.

## Language

**Persona usuaria**:
Persona física mayor de 18 años que crea una cuenta de Keepel para gestionar información de sus vehículos.
_Avoid_: Cliente, conductor, titular de la cuenta

**Intento de inicio de sesión**:
Solicitud para acceder a Keepel mediante unas credenciales. Puede terminar con acceso concedido, credenciales no válidas o inicio de sesión temporalmente no disponible. El resultado no revela si existe una cuenta asociada al email.
_Avoid_: Comprobación de cuenta, búsqueda de usuario

**Referencia de incidente**:
Identificador opaco que una persona usuaria puede comunicar a soporte para relacionar un resultado temporalmente no disponible con su diagnóstico interno. No contiene datos personales ni credenciales.
_Avoid_: Código de error, identificador de usuario

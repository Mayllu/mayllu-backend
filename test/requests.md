// test/requests.http
### Variables globales
@baseUrl = http://localhost:3000
@userId = 12345678
@categoryId = // Copiar el ID generado de las categorías

### Crear una nueva queja
POST {{baseUrl}}/complaints
Content-Type: application/json

{
  "userId": "{{userId}}",
  "title": "Falla en alumbrado",
  "description": "Luz parpadeante en esquina",
  "latitude": -12.1231,
  "longitude": -77.0123,
  "categoryId": "{{categoryId}}",
  "created_at": "2024-10-31T00:00:00.000Z",
  "updated_at": "2024-10-31T00:00:00.000Z"
}

### Obtener todas las quejas
GET {{baseUrl}}/complaints

### Obtener quejas por usuario
GET {{baseUrl}}/complaints/user/{{userId}}

### Obtener una queja específica
GET {{baseUrl}}/complaints/{{complaintId}}

### Actualizar una queja
PATCH {{baseUrl}}/complaints/{{complaintId}}
Content-Type: application/json

{
  "description": "Luz parpadeante en esquina - Actualizado",
  "latitude": -12.1232,
  "longitude": -77.0124
}

### Eliminar una queja
DELETE {{baseUrl}}/complaints/{{complaintId}}

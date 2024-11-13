<img src="https://github.com/Mayllu/.github/raw/main/profile/images/mayllu.png"></img>

# 🚀 NestJS Backend For Mayllu

Bienvenido al proyecto de backend para Mayllu creado con **NestJS**. Este proyecto proporciona una base sólida y escalable para construir aplicaciones web modernas y eficientes.

## 🛠️ Tecnologías Usadas

- [NestJS](https://nestjs.com/) - Framework para construir aplicaciones del lado del servidor
- [TypeScript](https://www.typescriptlang.org/) - Un superconjunto de JavaScript que añade tipos estáticos
- [PostgreSQL](https://www.postgresql.org/) - Sistema de gestión de bases de datos relacional
- [TypeORM](https://typeorm.io/) - ORM para TypeScript y JavaScript

## 🚀 Archivo env

Ejemplo de archivo env para poder desarrollar el software frontend, reemplazar con sus propias api key

```
MAYLLU_MONGO_URI=
MAYLLU_BACKEND_PORT=
JWT_SECRET=
B2_APPLICATION_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
GOOGLE_API_KEY=
```

## 📦 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/nestjs-backend.git
   ```
2. **Navega al directorio del proyecto:**
   ```bash
   cd nestjs-backend
   ```
3. **Instala las dependencias:**
   ```bash
   npm install
   ```
4. **Configura el archivo `.env`:**
   Copia el archivo `.env.example` a `.env` y ajusta las variables según tu configuración.
5. **Inicia el servidor:**
   ```bash
   npm run start:dev
   ```

## ⚙️ Estructura del Proyecto

```
nestjs-backend/
│
├── src/
│   ├── app.module.ts        # Módulo raíz de la aplicación
│   ├── main.ts              # Archivo de entrada
│   ├── modules/             # Módulos de la aplicación
│   ├── controllers/         # Controladores
│   └── services/            # Servicios
│
├── .env                      # Variables de entorno
├── package.json              # Dependencias y scripts
└── README.md                 # Documentación del proyecto
```

## 🌟 Características

- **RESTful API**: Crea y consume servicios RESTful fácilmente.
- **Validación**: Uso de `class-validator` para validar los datos de entrada.
- **Autenticación**: Implementación de JWT para proteger rutas y recursos.
- **Interacción con Base de Datos**: Conexión a PostgreSQL usando TypeORM.
- **Manejo de Errores**: Captura y manejo centralizado de errores.

## 🔗 Enlaces Útiles

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Ejemplo de API REST](https://docs.nestjs.com/techniques/http)
- [Guía de TypeORM](https://typeorm.io/#/)

## 🛠️ Contribución

Las contribuciones son bienvenidas. Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Haz un fork del proyecto
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva característica'`)
4. Envía tu rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

---

¡Gracias por tu interés en este proyecto! Si tienes preguntas o sugerencias, no dudes en abrir un issue.

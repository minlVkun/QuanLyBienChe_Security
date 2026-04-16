const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hệ thống Quản lý Biên chế API', // Đổi tên cho đúng đồ án
      version: '1.0.0',
      description: 'API phục vụ hệ thống quản lý nhân sự và biên chế bảo mật cao',
    },
    servers: [
      {
        url: 'http://localhost:3001', // Sửa lại thành 3001 cho khớp với app.js
        description: 'Local server',
      },
    ],
    // Thêm cấu hình để có nút "Authorize" trên Swagger
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đảm bảo đường dẫn này trỏ đúng đến các file route của bạn
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
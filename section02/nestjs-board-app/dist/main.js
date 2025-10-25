"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = 3000;
    await app.listen(process.env.PORT ?? port);
    common_1.Logger.log(`Application running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
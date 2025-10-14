"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeORMConfig = void 0;
const dotenv = require("dotenv");
dotenv.config();
exports.typeORMConfig = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'board.app',
    entities: [__dirname + '/../**/*.entity.{js, ts}'],
    synchronize: true,
};
//# sourceMappingURL=typeorm.config.js.map
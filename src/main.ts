import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as admin from 'firebase-admin';
import { config } from 'aws-sdk';
import { ServiceAccount } from "firebase-admin";
import * as helmet from 'helmet';

async function bootstrap() {
    const app           = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true , bodyParser : true });
    const configService = app.get(ConfigService);
    const port          = configService.get('PORT');

    app.enableCors();
    app.use(helmet());

    // fcm notification
    const adminConfig: ServiceAccount = {
        "projectId"   : configService.get<string>('FIREBASE_PROJECT_ID'),
        "privateKey"  : configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        "clientEmail" : configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    };

    admin.initializeApp({
        credential  : admin.credential.cert(adminConfig),
        databaseURL : configService.get<string>('MONGODB_URL'),
    })

    config.update({
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        region: configService.get('AWS_REGION'),
    }); 

    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

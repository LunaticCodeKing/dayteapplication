import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): object {
    return {status: "OK", timestamp: new Date()};
  }
}

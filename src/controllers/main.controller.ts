import { writeFileSync } from 'fs';
import { activateMain } from '../services/main.service';
import { Body, Controller, Get, Post, Query, Route } from 'tsoa';

@Route('/')
export class MainController extends Controller {
  @Get('/')
  public checkServer() {
    return {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };
  }

  @Post('/client')
  public addIdSecret(@Body() data: { clientId: string; clientSecret: string }): string {
    writeFileSync(`${__dirname}/../client.json`, JSON.stringify(data), 'utf8');
    return `Data received!`;
  }

  @Get('/redirect')
  public async main(@Query('code') code?: string) {
    activateMain(code);
    return `Application Activated!`;
  }
}

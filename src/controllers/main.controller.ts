import { writeFileSync } from 'fs';
import { activateMain, genTokens } from '../services/main.service';
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
    console.log(`Activating main...`);
    const { accessToken, refreshToken } = await genTokens(code);
    console.log(`Saving tokens in a file...`);
    writeFileSync(`${__dirname}/../tokens.json`, JSON.stringify({ accessToken, refreshToken }), 'utf8');
    console.log(`Tokens saved!`);
    activateMain();
    return `Application Activated!`;
  }
}

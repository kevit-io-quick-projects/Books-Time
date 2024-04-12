import { Controller, Get, Route } from 'tsoa';

@Route('/')
export class MainController extends Controller {
  @Get('/')
  public checkServer() {
    return `From the Server!`;
  }
}

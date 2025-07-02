import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { DialerService } from 'src/modules/dialer/dialer.service';

@Controller('dialer')
export class DialerController {
  constructor(private readonly dialerService: DialerService) {}

  @Get('access-token')
  async getAccessToken(@Req() req: Request, @Res() res: Response) {
    const data = await this.dialerService.generateAccessToken();
    res.status(HttpStatus.OK).send(data);
  }
}

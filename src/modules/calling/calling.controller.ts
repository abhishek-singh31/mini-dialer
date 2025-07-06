import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import { CallingService } from 'src/modules/calling/calling.service';

@Controller('calling')
export class CallingController {
  private readonly logger = new Logger(CallingController.name);
  constructor(private readonly callingService: CallingService) {}

  @Post('outbound')
  async outboundCallHandler(@Body() body, @Res() res) {
    this.logger.log('Outbound call handler', body);
    const twiml = await this.callingService.handleOutboundCall(body);
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('inbound')
  async inboundCallHandler(@Body() body, @Res() res) {
    this.logger.log('Inbound call handler', body);
    const twiml = await this.callingService.handleInboundCall();
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('handle-hold')
  async holdCallHandler(@Body() body, @Res() res) {
    this.logger.log('Hold call handler', body);
    const response = await this.callingService.handleHoldCall(body);
    res.type('application/json');
    res.send(response);
  }

  @Get('hold-twiml')
  async holdTwimlHandler(@Res() res) {
    const twiml = this.callingService.getHoldTwiml();
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('cold-transfer')
  async transferCallHandler(@Body() body, @Res() res) {
    this.logger.log('Transfer call handler', body);
    const twiml = await this.callingService.handleTransferCall(body);
    res.type('text/xml');
    res.send(twiml);
  }
}

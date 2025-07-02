import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class CallingService {
  handleOutboundCall = async (body: any) => {
    const { To: to } = body;
    const response = new Twilio.twiml.VoiceResponse();
    response.say('We are connecting you. Please wait');
    response.dial({ callerId: process.env.TWILIO_PHONE_NUMBER }).number(to);
    const twiml = response.toString();
    return twiml;
  };

  handleInboundCall = async () => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say('Welcome to mini dialer');
    response.pause({ length: 1 });
    response.dial().client(process.env.TWILIO_CLIENT_IDENTITY);
    const twiml = response.toString();
    return twiml;
  };
}

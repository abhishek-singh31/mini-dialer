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

  handleTransferCall = async (body) => {
    const { callSid, callFrom } = body;
    const client = this.getTwilioClient();
    const parentCallSid = (await client.calls(callSid).fetch()).parentCallSid;

    if (parentCallSid) {
      // inbound transfer
      const transferTwiml = this.getInboundCallTransferTwiml(callFrom);
      await client.calls(parentCallSid).update({ twiml: transferTwiml });
    } else {
      // outbound transfer
      const calls = await client.calls.list({
        parentCallSid: callSid,
      });
      const transferTwiml = this.getOutboundCallTransferTwiml(callFrom);
      await client.calls(calls[0].sid).update({ twiml: transferTwiml });
    }
    return true;
  };

  getTwilioClient = () => {
    const twilioClient = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    return twilioClient;
  };

  getInboundCallTransferTwiml = (callFrom: string) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      'Please wait while we are transferring your call to one of our agents',
    );
    response
      .dial({ callerId: callFrom })
      .number(process.env.INBOUND_TRANSFER_NUMBER);
    const twiml = response.toString();
    return twiml;
  };

  getOutboundCallTransferTwiml = (callFrom: string) => {
    const response = new Twilio.twiml.VoiceResponse();
    response.say(
      'Please wait while we are transferring your call to one of our agents',
    );
    response
      .dial({ callerId: callFrom })
      .number(process.env.OUTBOUND_TRANSFER_NUMBER);
    const twiml = response.toString();
    return twiml;
  };
}

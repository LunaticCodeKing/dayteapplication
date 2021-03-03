import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Server } from 'ws';
import { GatewayMetadataExtended } from './gatewaysockets.interface'
import * as admin from 'firebase-admin';
import { RoomsService } from '../rooms/rooms.service'    
import { ChatService } from '../chats/chats.service';

const serviceAccount = require("../../chatnotification-be11b-firebase-adminsdk-zf5pl-18d7e66a57.json");

const options = {
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, authorization, x-token',
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': '1728000',
      'Content-Length': '0',
    };
    res.writeHead(200, headers);
    res.end();
  },
} as GatewayMetadataExtended;


@WebSocketGateway({ namespace: '/chatapp', options })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;
  constructor(
        private readonly roomService : RoomsService,
        private readonly chatService : ChatService
      ) {}

  private logger: Logger = new Logger('SocketGateway');
  
  @SubscribeMessage('createroom')
  public createroom(client: Socket, room: any) : any {
      // create room mongo id
      // get mongo id with userid
      const result = this.roomService.create(client.id)
      return result
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(client: Socket, room: any): void {
      //console.log("joinroom client",client)
      console.log("joinroom client",client.nsp.users)
      console.log("room userid",room.userId)
      client.nsp.users.push(room.userId)
      client.userId = room.userId
      client.join(room.roomId);
      client.emit('joinedRoom', room.roomId); 
      console.log("client.userId",client.userId)
  }

  @SubscribeMessage('chat')
  async handlechat(client: Socket, payload: any): Promise<WsResponse<any>> {  
      const frontpayload = {
          username    : client.userId,
          roomId      : payload[1],
          message     : payload[2],
          messageType : payload[3] 
      }

      let receiveId : any;
      //let deviceId  : any;
      client.nsp.users.filter((id) => {
          if(id != client.userId)
          {
             receiveId = id;
          }
      })

      const insert = {
          roomId      : payload[1],  
          senderId    : client.userId,
          recieverId  : receiveId,
          message     : payload[2],
          messageType : payload[3],
          deviceId    : payload[4] 
      }

      // admin.initializeApp({
      //   credential : admin.credential.cert(serviceAccount)
      // });

      // const fcmpayload = {
      //     'notification' : {
      //         'title' : `just logged an event`,
      //         'body'  : `aasdfasdf`,
      //     }, 
      //     'data' : { 'personSent': deviceId}
      // };
    
      await this.chatService.createChat(insert)
      // await admin.messaging().sendToDevice(serverKey, fcmpayload);
      return this.server.to(payload[1]).emit('message', frontpayload);
  }

  @SubscribeMessage('leaveroom')
  public leaveRoom(client: Socket, room: any): void {
      client.leave(room.roomId);
      client.emit('leftRoom', room.roomId);
  }

  public afterInit(server: Server): void {
      server.users = []
      return this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
      return this.logger.log(`Client disconnected: ${client.id}`);
  }

  public handleConnection(client: Socket): void {
     return this.logger.log(`Client connected: ${client.id}`);
  }
}

import {
    Controller,
    Post,
    Body,
    Get,
    Param,
  } from '@nestjs/common';
  
  import { ObjectId } from 'mongoose';
  
  import { UserService } from './users.service';
  
  @Controller('users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Post('createuser')
    async addUser(@Body('userID') userid: ObjectId, @Body('username') usersname: string) {
      console.log("UserId in controller ",userid)
      console.log("username in controller ",usersname)
      const generatedId = await this.userService.insertUser(userid,usersname);
      return { id: generatedId };
    }
  
    // @Get('/allusers')
    // async getAllUsers() {
    //   const products = await this.userService.getUsers();
    //   return products;
    // }
  
    @Get('user/:id')
    getUserId(@Param('id') userId: Object) {
       return this.userService.getUserId(userId);
    }
  
    // @Patch(':id')
    // async updateProduct(
    //   @Param('id') prodId: string,
    //   @Body('title') prodTitle: string,
    //   @Body('description') prodDesc: string,
    //   @Body('price') prodPrice: number,
    // ) {
    //   await this.productsService.updateProduct(prodId, prodTitle, prodDesc, prodPrice);
    //   return null;
    // }
  
    // @Delete(':id')
    // async removeProduct(@Param('id') prodId: string) {
    //     await this.productsService.deleteProduct(prodId);
    //     return null;
    // }
  }
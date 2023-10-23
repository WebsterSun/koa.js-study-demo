import { Context } from "koa";
import * as argon2 from 'argon2';
import {User} from "../entity/user"
import  {appDataSource}  from "../../src/server";
import  jwt  from "jsonwebtoken";
import { JWT_SECRET } from "../../src/constants";
import { UnauthorizedException } from "../exceptions";

export default class AuthController {
  public static async login(ctx: Context){
    // ctx.body = 'Login controller'
    const userRepository = appDataSource.getRepository(User)
    const user = await userRepository
      .createQueryBuilder()
      .where({name:ctx.request.body.name})
      .addSelect('User.password')
      .getOne()
    if(!user){
      // ctx.status = 401
      // ctx.body = {message:'用户名不存在'}
      throw new UnauthorizedException('用户名不存在')
    }else if(await argon2.verify(user.password,ctx.request.body.password)){
      ctx.status = 200
      ctx.body = {token:jwt.sign({id:user.id},JWT_SECRET)}
    }else{
      // ctx.status = 401
      // ctx.body = {message:'密码错误'}
      throw new UnauthorizedException('密码错误')
    }
  }

  public static async register(ctx:Context){
    // ctx.body = 'Register controller'
    const userRepository = appDataSource.getRepository(User)
    const newUser = new User();
    newUser.name = ctx.request.body.name
    newUser.email = ctx.request.body.email
    newUser.password = await argon2.hash(ctx.request.body.password)
    console.log(ctx.request.body)
    const user = await userRepository.save(newUser)
    ctx.status = 201
    ctx.body = user
    // ctx.body = ctx.request.body
  }
}

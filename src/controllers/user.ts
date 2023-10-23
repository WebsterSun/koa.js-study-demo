import { Context } from "koa";
import {User} from "../entity/user"
import  {appDataSource}  from "../../src/server";
import { NotFoundException, ForbiddenException } from "../exceptions";

export default class UserController {
  public static async listUser(ctx: Context){
    const userRepository = appDataSource.getRepository(User)
    const users = await userRepository.find()
    ctx.status = 200
    ctx.body = users
  }

  public static async showUserDetail(ctx:Context){
    // ctx.body = `showUserDetail controller with ID = ${ctx.params.id}`
    const userRepository = appDataSource.getRepository(User)
    console.log(ctx.params.id)
    const user = await userRepository.findOne({
      where:{id:ctx.params.id}
    })
    if(user){
      ctx.status = 200
      ctx.body = user
    }else{
      // ctx.status = 404
      throw new NotFoundException()
    }
  }

  public static async updateUser(ctx:Context){
    // ctx.body = `UpdateUser controller with ID = ${ctx.params.id}`
    const userId = ctx.params.id

    if(userId !== ctx.state.user.id){
      // ctx.status = 403
      // ctx.body = {message:'无权限进行此操作'}
      throw new ForbiddenException()
    }

    const userRepository = appDataSource.getRepository(User)
    await userRepository.update(ctx.params.id,ctx.request.body)
    const updatedUser = await userRepository.findOne({
      where:{id:ctx.params.id}
    })

    if(updatedUser){
      ctx.status = 200
      ctx.body = updatedUser
    }else{
      ctx.status = 404
    }

  }

  public static async deleteUser(ctx:Context){
    // ctx.body = `DeleteUser controller with ID = ${ctx.params.id}`
    const userId = ctx.params.id

    if(userId !== ctx.state.user.id){
      // ctx.status = 403
      // ctx.body = {message:'无权限进行此操作'}
      // return
      throw new ForbiddenException()
    }
    const userRepository = appDataSource.getRepository(User)
    await userRepository.delete(ctx.params.id)
    ctx.status = 204
  }
}

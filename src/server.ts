import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import {logger} from './logger';
import {unprotectedRouter,protectedRouter} from './routes';
import  {DataSource}  from 'typeorm';
import "reflect-metadata"
import jwt from 'koa-jwt';
import { JWT_SECRET } from './constants';

export const appDataSource  = new DataSource({
  "type":"mysql",
  "host":"localhost",
  "port":3306,
  "username":"user",
  "password":"pass",
  "database":"koa",
  "synchronize":true,
  "entities":["src/entity/*.ts"]
})


appDataSource.initialize().then(()=>{
  // 初始化 Koa 应用实例
  const app = new Koa();

  // 注册中间件
  app.use(logger());
  app.use(cors());
  app.use(bodyParser());

  app.use(async (ctx,next)=>{
    try{
      await next()
    }catch(err){
      ctx.status = err.status || 500 
      ctx.body = {message: err.message}
    }
  })

  // 响应用户请求
  app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

  app.use(jwt({secret:JWT_SECRET}).unless({method: 'GET'}))

  app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods())

  // 运行服务器
  app.listen(3000)
}).catch((err:string)=>{
  console.log("Typeorm connection error",err)
})

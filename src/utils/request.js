// 基于axios封装的请求模块

import axios from 'axios'
import router from '@/router' //引入router
import qs from 'qs' //引入qs模块，用于序列化post请求参数
import JSONBig from 'json-bigint'
import { Message, MessageBox } from 'element-ui'

// import wx from 'weixin-js-sdk'

import { BASE_URL } from '@/global/config'

// 创建一个 axios 实例 , 说白了就是复制一个 axios
// 我们通过这个实例去发请求,把需要的配置 配置给这个实例来处理
const request = axios.create({
  baseURL: BASE_URL, // 请求的基础路径
  withCredentials: true, // 跨域请求时是否需要使用凭证
  // 定义后端返回的原始数据的处理
  // 参数 data 就是后端返回的原始数据(未经处理的 JSON格式字符串)
  transformResponse: [
    function (data) {
      // Do whatever you want to transform the data

      // 后端返回的数据可能不是 JSON格式字符串
      // 如果不是的话,那么 JSONBig.parse 调用就会报错
      // 所以我们使用 try-catch 来捕获异常,处理异常的发生
      try {
        // 如果转换成功,则直接把结果返回
        return JSONBig.parse(data) // 需要使用就 toString()
      } catch (error) {
        // 如果转换失败了,则进入这里
        // 我们在这里把数据原封不动的直接返回给请求使用
        return data
      }

      // axios 默认在内部使用 JSON.parse来转换处理原始数据
      // return JSON.parse(data)
    },
  ],
})

// const requestHello = axios.create({
//   baseURL: 'http://120.78.198.167:8080' // 请求的基础路径
// })
// 请求拦截器
request.interceptors.request.use(
  // 所以请求都会经过这里
  // config 是当前请求相关的配置信息对象
  // config 是可以修改的
  function (config) {
    // console.log('进入:', config)
    // 然后我们就可以在允许请求出去之前定制统一业务功能处理
    // 例如：统一的设置 token

    // 如果是登录请求,那么执行完再执行其它接口请求

    // 如果是 post 请求,并且请求的数据是对象格式
    // if (config.method === 'post' && config.data) {
    //   // console.log('old config.data', config.data)
    //   // 设置请求头 发送的数据是x-www-form-urlencoded 格式
    //   config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    //   // qs.stringify(object, [options]) 字符串化时，默认情况下，qs 对输出进行 URI 编码，以避免某些特殊字符对某些接口的调用造成请求失败。
    //   //encode: false 禁用encode编码
    //   config.data = qs.stringify(config.data, { encode: false })
    //   // console.log('new config.data', config.data)
    // }
    // 如果是 post 请求,并且请求的数据是对象格式
    if (config.method === 'post' && config.data) {
      if (config.headers['myType']) {
        if (config.headers['myType'] === 'none') {
          return
        }
        config.headers['Content-Type'] = config.headers['myType']
        config.data = JSON.stringify(config.data)
      } else {
        // console.log('old config.data', config.data)
        // 设置请求头 发送的数据是x-www-form-urlencoded 格式
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        // qs.stringify(object, [options]) 字符串化时，默认情况下，qs 对输出进行 URI 编码，以避免某些特殊字符对某些接口的调用造成请求失败。
        //encode: false 禁用encode编码
        config.data = qs.stringify(config.data, { encode: false })
        // console.log('new config.data', config.data)
      }
    }
    // 取到本地存储中的用户信息 getItem
    // 再还原成 JSON格式，就可用点方法调用
    var user = JSON.parse(window.sessionStorage.getItem('user'))
    // 如果有登录用户信息（不为空），则统一设置 token

    // 属性名和值一般看接口的要求
    // 如以下
    // 属性名： Authorization
    // 属性值：'Bearer空格token数据'  （这里为测试，暂时写死）
    // `Bearer ${user.token}`  反引号里面${}  ES6里面的字符串拼接

    if (user) {
      // config.headers.Authorization = `Bearer ${user.token}`
      config.headers.res_token = `${user.res_token}`
      config.headers['X-CSRF-TOKEN'] = `${user.token.token}`
    } else {
      // 暂时使用通用res_token
      // config.headers.res_token = 'adeebd32-5f54-4a88-9821-f38c44538dca'
    }

    // 当这里 return config 之后，请求才会真正的发出去
    // console.log('new请求', config)
    return config
  },
  // 请求失败，会经过这里
  function (error) {
    console.log('请求失败:::', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  res => {
    // 如果rs=-5 提示退回到菜单
    if (res.data.rs === '-5') {
      console.log('响应结果', res.data.rs)
      MessageBox.alert('登录已失效,是否重新登录?', '登录提示', {
        confirmButtonText: '立即登录',
        callback: action => {
          // 清除登录信息
          window.sessionStorage.removeItem('user')
          window.sessionStorage.removeItem('enterpriseName')
          window.sessionStorage.removeItem('userName')
          window.sessionStorage.removeItem('memberID')
          // 跳转到登录页面
          router.push({
            //传递参数使用query的话，指定path或者name都行，但使用params的话，只能使用name指定
            path: '/login',
            query: {
              auth: '0',
            },
          })
        },
      })
    }
    // 如果rs=-6,提示跳转到登录
    if (res.data.rs === '-6') {
      console.log('响应结果', res.data.rs)
      MessageBox.alert('登录已失效,是否重新登录?', '登录提示', {
        confirmButtonText: '立即登录',
        callback: action => {
          // 清除登录信息
          window.sessionStorage.removeItem('user')
          window.sessionStorage.removeItem('enterpriseName')
          window.sessionStorage.removeItem('userName')
          window.sessionStorage.removeItem('memberID')
          // 跳转到登录页面
          router.push({
            //传递参数使用query的话，指定path或者name都行，但使用params的话，只能使用name指定
            path: '/login',
            query: {
              auth: '0',
            },
          })
        },
      })
    }
    return res
  },
  err => Promise.reject(err)
)

// 导出请求方法
export default request

// 谁要用,谁就加载 request 模块
// import request from 'request.js'
// request.xx
// request({
//   methods:'',
//   url: ''
// })

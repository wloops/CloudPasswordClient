//src/store/home.js

import { defineStore } from 'pinia'

export const useHomeStore = defineStore({
  id: 'home', // id必填，且需要唯一
  state: () => {
    return {
      // hello: '',
      curentProduct: '',
      storeProductList: [],
    }
  },
  getters: {
    // getHello: state => {
    //   return state.hello
    // },
    getCurentProduct: state => {
      return state.curentProduct
    },
    getStoreProductList: state => {
      return state.storeProductList
    },
  },
  actions: {
    // setHello(payload) {
    //   this.hello = payload
    // },
    setCurentProduct(payload) {
      this.curentProduct = payload
    },
    setStoreProductList(payload) {
      this.storeProductList = payload
    },
    // // 异步actions
    // async login(account, pwd) {
    //   const { data } = await api.login(account, pwd)
    //   return data
    // },
  },
  // 开启数据缓存 数据默认存在 sessionStorage 里，并且会以 store 的 id 作为 key
  // 可以在 strategies 里自定义 key 值，并将存放位置由 sessionStorage 改为 sessionStorage
  persist: {
    enabled: true,
    // strategies: [
    //   {
    //     key: 'my_user',
    //     storage: sessionStorage,
    //     paths: ['name', 'age'], // 持久化部分的 state
    //   },
    // ],
  },
})

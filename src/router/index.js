import Vue from 'vue'
import Router from 'vue-router'
import Portfolio from '@/components/Portfolio'
import Coins from '@/components/Coins'
import Donut from '@/components/Donut'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      components: {
        default: Portfolio,
        coins: Coins,
        donut: Donut
      }
    }
  ]
})

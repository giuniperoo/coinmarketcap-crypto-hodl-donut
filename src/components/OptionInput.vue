<template>
  <label :class='sharedState.options[name] === type ? "active" : ""'>
    <span>{{ symbol ? symbol : type }}</span>
    <input
      type='radio'
      :value='type'
      @change='handleChange'
      v-model='sharedState.options[name]'
    >
  </label>
</template>

<script>
  import Vue from 'vue'
  import store from '../store'
  import { setLocale, updatePortfolioWithCoinData } from '../actions'

  export default {
    name: 'OptionInput',
    props: ['name', 'type', 'symbol'],
    data () {
      return { sharedState: store.state }
    },
    methods: {
      handleChange () {
        switch (this.name) {
          case 'currency':
            setLocale()
            updatePortfolioWithCoinData()
            break
          case 'percentChange':
            updatePortfolioWithCoinData()
        }

        // update local storage
        Vue.ls.set('options', this.sharedState.options)
      }
    }
  }
</script>

<style lang='scss' scoped>
  label {
    width: 70px;
    margin: 0 25px;
    cursor: pointer;

    &:hover span,
    &.active span {
      transform: scale(1.6);
    }

    &.active {
      background: darkkhaki;
      border-radius: 3px;

      span { color: white; }
    }

    span {
      top: 1px;
      display: inline-block;
      position: relative;
      transition: transform 300ms;
    }
  }

  input[type=radio] { display: none; }
</style>

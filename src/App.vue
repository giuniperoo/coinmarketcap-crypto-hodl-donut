<template>
  <div>
    <overlay v-if='sharedState.overlay.active' />
    <optionComponent v-if='sharedState.activeOption' />
    <router-view />
    <div class='viewWindow'>
      <div :class='["slideContainer", sharedState.activeSection]'>
        <router-view name='donut' />
        <router-view name='coins' />
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import store from './store'
  import Option from '@/components/Option'
  import Overlay from '@/components/Overlay'
  import VueLocalStorage from 'vue-ls'
  import {
    setLocale,
    toggleOptions,
    toggleOverlay,
    setActiveSection,
    loadOptionsFromLocalStorage
  } from './actions'

  Vue.use(VueLocalStorage)

  export default {
    name: 'App',
    components: {
      overlay: Overlay,
      optionComponent: Option
    },
    data () {
      return {
        sharedState: store.state
      }
    },
    methods: {
      handleKeyUp (event) {
        const keyAliases = {
          /* VIEW TOGGLE */
          LEFT_ARROW: 37,
          RIGHT_ARROW: 39,

          /* OPTIONS */
          CURRENCY: 67,
          API_LIMIT: 65,
          PERCENT_CHANGE: 80
        }

        /* handle context-specific UX cases */

        // when left section displayed...
        if (this.sharedState.activeSection === 'left') {
          // do nothing if user is typing inside input
          if (event.target.matches('input')) return

          // ignore calls to transition left
          if (event.keyCode === keyAliases.LEFT_ARROW) return
        }

        // when right section displayed...
        if (this.sharedState.activeSection === 'right') {
          // do nothing if user is typing inside input
          if (event.target.matches('input')) return

          // do not allow slide transition left if portfolio empty
          if (event.keyCode === keyAliases.LEFT_ARROW &&
              !this.sharedState.portfolio.length) return

          // ignore calls to transition right
          if (event.keyCode === keyAliases.RIGHT_ARROW) return
        }

        // do not allow slide transition if options displayed
        if (this.sharedState.activeOption &&
            (event.keyCode === keyAliases.LEFT_ARROW ||
             event.keyCode === keyAliases.RIGHT_ARROW)
        ) return

        switch (event.keyCode) {
          case keyAliases.LEFT_ARROW:
            setActiveSection('left')
            break
          case keyAliases.RIGHT_ARROW:
            setActiveSection('right')
            break
          case keyAliases.CURRENCY:
            toggleOverlay(true)
            toggleOptions('currency')
            break
          case keyAliases.API_LIMIT:
            toggleOverlay(true)
            toggleOptions('apiLimit')
            break
          case keyAliases.PERCENT_CHANGE:
            toggleOverlay(true)
            toggleOptions('percentChange')
        }
      }
    },
    mounted: function () {
      document.addEventListener('keyup', this.handleKeyUp)

      loadOptionsFromLocalStorage()
      setLocale()

      // if portfolio exists display donut by default
      if (this.sharedState.portfolio.length) setActiveSection('left')
    },
    beforeDestroy: function () {
      document.removeEventListener('keyup', this.handleKeyUp)
    },
    watch: {
      'sharedState.portfolio': function () {
        if (this.sharedState.portfolio.length === 0 &&
            this.sharedState.activeSection === 'left') {
          setActiveSection('right')
        }
      }
    }
  }
</script>

<style lang='scss'>
  @import '../node_modules/normalize.css/normalize.css';
  @import './assets/global.css';

  @import './assets/third-party/css/cryptocoins.scss';
  @import './assets/third-party/css/cryptocoins-colors.scss';

  @each $coin, $color in $ccColors {
    .#{$coin} { color: $color; }
  }

  .viewWindow {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    min-width: 850px;
  }

  .slideContainer {
    right: 0;
    width: 200%;
    height: 100%;
    display: flex;
    overflow: hidden;
    position: absolute;
    transition: 600ms transform;
  }

  .left { transform: translateX(50%); }
</style>

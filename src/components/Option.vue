<template>
  <div>
    <span>{{ options[sharedState.activeOption].title }}</span>
    <ul>
      <li v-for='prop in options[sharedState.activeOption].props'>
        <optionInput
          :name='sharedState.activeOption'
          :type='prop.type'
          :symbol='prop.symbol'
        />
      </li>
    </ul>
  </div>
</template>

<script>
  import store from '../store'
  import OptionInput from './OptionInput'
  import { setOptionType, toggleOptions, toggleOverlay } from '../actions'

  export default {
    name: 'Option',
    components: {
      optionInput: OptionInput
    },
    data () {
      return {
        sharedState: store.state,
        options: {
          apiLimit: {
            title: 'Api limit',
            props: [
              {type: '100'},
              {type: '500'},
              {type: 'All'}
            ]
          },
          currency: {
            title: 'Currency',
            props: [
              {type: 'usd', symbol: '$'},
              {type: 'eur', symbol: '€'},
              {type: 'btc', symbol: '₿'}
            ]
          },
          percentChange: {
            title: 'Percent change',
            props: [
              {type: '1h'},
              {type: '24h'},
              {type: '7d'}
            ]
          }
        }
      }
    },
    mounted: function () {
      document.addEventListener('keyup', this.handleKeyUp)
      document.addEventListener('click', this.handleClick)
    },
    beforeDestroy: function () {
      document.removeEventListener('keyup', this.handleKeyUp)
      document.removeEventListener('click', this.handleClick)
    },
    methods: {
      handleKeyUp (event) {
        const keyAliases = {
          ENTER: 13,
          ESCAPE: 27,
          LEFT_ARROW: 37,
          RIGHT_ARROW: 39
        }

        if (this.sharedState.activeOption !== false) {
          switch (event.keyCode) {
            case keyAliases.ENTER:
            case keyAliases.ESCAPE:
              this.hide()
              break
            case keyAliases.LEFT_ARROW:
              this.select('left')
              break
            case keyAliases.RIGHT_ARROW:
              this.select('right')
          }
        }
      },
      hide () {
        if (this.sharedState.activeOption) {
          toggleOptions(false)
          toggleOverlay(false)
        }
      },
      select (direction) {
        const activeOption = this.sharedState.activeOption
        const selected = this.sharedState.options[activeOption]
        const types = this.options[activeOption].props.map(prop => prop.type)
        const index = types.indexOf(selected)

        if (direction === 'left') {
          if (index === 0) {
            setOptionType(types[types.length - 1])
          } else {
            setOptionType(types[index - 1])
          }
        }

        if (direction === 'right') {
          if (index === types.length - 1) {
            setOptionType(types[0])
          } else {
            setOptionType(types[index + 1])
          }
        }
      },
      handleClick (event) {
        if (event.target.matches('#overlay.active')) this.hide()
      }
    }
  }
</script>

<style scoped>
  div {
    top: 300px;
    left: 50%;
    width: 550px;
    z-index: 9;
    display: flex;
    padding: 5px 20px;
    overflow: hidden;
    position: absolute;
    font-size: 1.4rem;
    transform: translateX(-50%);
    background: white;
    text-align: center;
    line-height: 2.4rem;
    align-items: center;
    border-radius: 3px;
    justify-content: flex-end;
  }

  ul { margin: 0; }
  li { display: inline-flex; }

  span {
    left: 0;
    color: white;
    padding: 5px 20px;
    position: absolute;
    font-style: italic;
    background: darkkhaki;
  }
</style>

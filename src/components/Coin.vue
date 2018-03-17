<template>
  <div>
    <i :class='["cc", this.ticker]' :data-ticker='ticker' :title='ticker' @click.stop='toggleInputPopup'></i>
    <aside v-if='sharedState.selectedCoin === ticker'>
      <inputPopup :ticker='ticker' />
    </aside>
  </div>
</template>

<script>
  import store from '../store'
  import { setSelectedCoin, toggleOverlay } from '../actions'
  import InputPopup from '@/components/InputPopup'

  export default {
    name: 'Coin',
    props: ['ticker'],
    components: {
      inputPopup: InputPopup
    },
    data () {
      return { sharedState: store.state }
    },
    methods: {
      toggleInputPopup (event) {
        const dataName = this.$el.getElementsByTagName('i')[0].getAttribute('data-ticker')
        if (dataName !== this.sharedState.selectedCoin) {
          setSelectedCoin(event.target.getAttribute('data-ticker'))
          toggleOverlay(true, true)
        }
      }
    }
  }
</script>

<style scoped>
  div { transform: translateZ(0); }

  .cc {
    cursor: pointer;
    filter: grayscale(90%);
    margin: 1.2rem 1.3rem;
    display: inline-block;
    font-size: 4rem;
    transition: 0.3s ease all;
  }
  .cc:hover {
    filter: grayscale(0);
    transform: scale(1.2);
  }
</style>

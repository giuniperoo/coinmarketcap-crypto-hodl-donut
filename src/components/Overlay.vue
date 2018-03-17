<template>
  <div
    id='overlay'
    :class='{active: sharedState.overlay.active, clickThru: sharedState.overlay.clickThru}'
  ></div>
</template>

<script>
  import store from '../store'

  export default {
    name: 'Overlay',
    data () {
      return { sharedState: store.state }
    }
  }
</script>

<style lang='scss'>
  #overlay.active {
    & ~ #portfolio { filter: blur(1px); }

    & ~ .viewWindow {
      #chart,
      #updater,
      #coinInput,
      .coins li:not(.active) { filter: blur(1px); }
    }
  }
</style>

<style lang='scss' scoped>
  div {
    display: none;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    position: fixed;
    background: rgba(0, 0, 0, 0.1);

    &.active { display: block; }
    &.clickThru { pointer-events: none; }
  }
</style>

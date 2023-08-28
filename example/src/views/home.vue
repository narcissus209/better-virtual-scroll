<template>
  <div class="home">
    <div class="container">
      <RouterView></RouterView>
    </div>
    <div class="nav-bar">
      <RouterLink class="item" to="/demo1">简单列表</RouterLink>
      <RouterLink class="item" to="/demo2">demo2</RouterLink>
      <RouterLink class="item" to="/demo3">demo3</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
@footerHeight: 48px;
.home {
  height: 100vh;
  width: 100vw;
  overflow: auto;
  .container {
    height: calc(100% - @footerHeight);
    width: 100%;
    overflow: auto;
  }
  .nav-bar {
    height: @footerHeight;
    width: 100%;
    display: flex;
    line-height: @footerHeight;
    background: #eee9;
    .item {
      height: 100%;
      flex: 1;
      text-align: center;
      color: #333333;
      text-decoration: none;
    }
    .router-link-active {
      color: #669ede;
      background: #669ede33;
    }
  }
}
</style>

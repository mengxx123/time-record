<template>
    <ui-page :title="title || page.title" :page="page" :backable="backable" ref="page">
        <div slot="drawer">
            <div class="header">
                <img class="logo" src="/static/img/sign.svg">
            </div>
            <ui-list @itemClick="toggle()">
                <ui-list-item title="时间记录" to="/record">
                    <ui-icon slot="left" value="home"/>
                </ui-list-item>
                <ui-list-item title="我的提醒" to="/notice">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="我的物品" to="/objects">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="书籍/视频" to="/acg">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="我的饮食" to="/eat">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="我的旅游" to="/location">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="今天" to="/today">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="打卡" to="/home">
                    <ui-icon slot="left" value="grade"/>
                </ui-list-item>
                <ui-list-item title="关于" href="https://project.yunser.com/products/24a9f1301bd211e9a2192102b42ff108" target="_blank">
                    <ui-icon slot="left" value="info"/>
                </ui-list-item>
            </ui-list>
        </div>
        <slot></slot>
    </ui-page>
</template>

<script>
    export default {
        data() {
            return {
                open: false,
                docked: true
            }
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: 'default'
            },
            page: {
                type: Object,
                default: function () {
                    return {
                        title: '云设'
                    }
                }
            },
            backable: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            toggle() {
                console.log(this.$refs.page)
            }
        }
    }
</script>

<style lang="scss" scoped>
.header {
    padding: 40px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.logo {
    display: block;
    width: 80px;
    margin: 0 auto;
}
.ui-position-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
}
</style>

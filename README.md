# gulp_demo

##目录结构

gulp_demo

    - assets 【编译后的css和js】
    
        - css
        
        - js
        
    - doc   【说明】
    
    - src   【前端开发源码】
    
        - config    【配置文件】
            - base.core.properties  【对gulp的控制】
            - base.paths.properties 【所有源码和编译代码的基础路径】
            - css.files.properties  【css源码所在路径】
            - js.alias.properties   【js别名】
            - js.common.properties  【js的common文件配置】
            - js.files.properties   【js源码所在路径】
            - js.ignore.properties  【js在编译时需要忽略的别名】
        - css   【css源码】
            - common        【css的公共部分】
            - components    【css公共组件】
                - plugins   【插件css部分】
            - source        【css源码】
                - backstage
                - forestage
                    - homepage
                        - test.scss
        - fonts 【字体】
        - imgs  【图片】
        - js    【js源码】
            - components    【js公共组件】
                - plugins   【插件js部分】
            - lib           【js库】
            - source        【js源码】
                - backstage
                - forestage
                    - homepage
                        - test.js
        - views 【jsp/html源码】
            - components    【views公共组件】
                - plugins   【插件views部分】
            - source        【views源码】
                - backstage
                - forestage
                    - homepage
                        - test.html
    - views 【编译后的jsp/html】
        - forestage
            - homepage
                - test.html


###使用browser sync的好处：


1. browser sync里自带一个服务器，帮助我们写完静态页面后，在把html变为服务器端动态页面(如：php、asp、jsp)的时候，可以让所有src路径保持原有状态，不用改动。
2. 在配合使用gulp watch的时候，它会自动帮你刷新页面，因为在你做ctrl+s操作的时候，源码编译的时间并不确定，所以在你切换回到浏览器的时候也不知道什么时候刷新比较好，因为可能还没编译好，然而browser sync正是帮你解决了这个问题，你只需要ctrl+s之后并进入浏览器等待结果就ok了，不需要人为等待编译完成之后再执行页面刷新。

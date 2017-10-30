export default {

    methods: {
        calculateDownBorder(){
            const t = this;
            t.downBorder = (-(Object.keys(t.fixedLeftIndexData).length) * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio          
        },
    }
}
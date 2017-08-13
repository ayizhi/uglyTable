//表头的每一个格子

class paneCanvas {
    constructor (obj){
        const t = this;
        t.canvas = document.createElement('canvas');
        t.ctx = t.canvas.getContext('2d');

        t.ratio = obj.ratio || 2;        
        t.width = obj.width * t.ratio;
        t.height = obj.height * t.ratio;

        t.canvas.width = t.width;
        t.canvas.height = t.height;

        t.draw();
        return t;
    };

    draw(){
        const t = this;
        t.ctx.beginPath();
        t.ctx.moveTo(0,0);
        t.ctx.lineTo(t.width,0);
        t.ctx.lineTo(t.width,t.height);
        t.ctx.lineTo(0,t.height);
        t.ctx.lineTo(0,0);
        t.ctx.lineWidth = 1;
        t.ctx.strokeStyle = '#000';
        t.ctx.stroke();
    };


}

export default paneCanvas
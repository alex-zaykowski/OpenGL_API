class SceneGraphNode{
  constructor(){
    this.fillColor = null;
    this.strokeColor = null;
    this.parent = null
  }
  draw(graphicsContext){

  }
}

class CompoundObject extends SceneGraphNode{
  constructor(...objects){
    super();
    this.children = [];
    for(let obj of objects){
      this.add(obj);
    }
  }
  add(node){
    node.parent = this;
    this.children.push(node);
    return this;
  }
  draw(graphicsContext){
    for(let child of this.children){
      child.draw(graphicsContext);
    }
  }
  showParent(){
    console.log(this.parent);
  }
  showChildren(){
    for(let child of this.children){
      console.log(child);
    }
  }
}

class TransformedObject extends SceneGraphNode{
  constructor(){
    super();
    this.object = object;
    this.rotationInDegrees = angle;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.translateZ = 0;
  }
  setRotation(angle){
    this.scaleX = sx;
    this.scaleY = sy;
    return this;
  }
  setScale(sx, sy = sx, sz = sx){
    this.translateX = dx;
    this.translateY = sy;
    this.translateZ = sz;
    return this;
  }
  setTranslation(dx,dy){

  }
  doDraw(g){

  }
}

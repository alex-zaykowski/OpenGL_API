/**
 * SceneGraphNode is a class to represent an object in the scene graph
 */
 class SceneGraphNode {
  constructor() {
    this.r = 1;
    this.g = 1;
    this.b = 1;
    this.lineColor = null;
    this.parent = null;
  }
  doDraw() {
    throw "doDraw not implemented in SceneGraphNode";
  }
  clone(){
    let clone = Object.create(Object.getPrototypeOf(this));
    clone.parent = null;
    clone.setColor(this.r, this.g, this.b);
    return clone;
  }
  draw() {
    glPushMatrix();
    this.doDraw();
    glPopMatrix();
  }
  setColor(red, green, blue) {
    this.r = red;
    this.g = green;
    this.b = blue;
    return this;
  }
}

/**
 * CompoundObject represents an object that is a collection of smaller objects
 * used to build one new object.
 *
 * @objects - An unlimited number of objects which are being used to construct the CompoundObject
 */
class CompoundObject extends SceneGraphNode {
  constructor(...objects) {
    super();
    this.children = [];
    for (let obj of objects) {
      this.add(obj);
    }
  }
  add(node) {
    node.parent = this;
    this.children.push(node);
    return this;
  }
  clone(){
    let clone = super.clone();
    clone.children = [];
    for(let i = 0; i < this.children.length; i++){
      clone.add(this.children[i].clone())
    }
    return clone;
  }
  doDraw() {
    for (let child of this.children) {
      child.draw(); //why is this draw() in the API what if we need multiple CompoundObjects
    }
  }
}

/**
 * IFSModel is a class extending SceneGraphNode that takes a string argument
 * to determine what 3d object should be drawn using the data from the basic-object-models-IFS.js
 * file. Supported types are: Cube, uvSphere, uvTorus, uvCone, and uvCylinder
 * @type - String argument to determine the IFS model to be drawn
 *         accepted arguments are: "Cube", "Sphere", "Torus", "Cone", and "Cylinder"
 */
class IFSModel extends SceneGraphNode {
  constructor(type) {
    super();
    this.type = type;
    this.obj;
  }
  clone(){
    let clone = super.clone();
    clone.type = this.type;
    return clone;
  }
  doDraw() {
    switch (this.type) {
      case "Cube":
        this.obj = cube();
        break;
      case "Sphere":
        this.obj = uvSphere();
        break;
      case "Torus":
        this.obj = uvTorus();
        break;
      case "Cone":
        this.obj = uvCone();
        break;
      case "Cylinder":
        this.obj = uvCylinder();
        break;
      default:
        throw ("Error: IFSModel does not contain a " + this.type + " model");
    }
    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_NORMAL_ARRAY);
    glScalef(3, 3, 3);
    glColor3f(this.r, this.g, this.b);
    glVertexPointer(3, GL_FLOAT, 0, this.obj.vertexPositions);
    glNormalPointer(GL_FLOAT, 0, this.obj.vertexNormals);
    glPolygonOffset(1, 1);
    glEnable(GL_POLYGON_OFFSET_FILL);
    glDrawElements(GL_TRIANGLES, this.obj.indices.length, GL_UNSIGNED_SHORT, this.obj.indices);
    glDisable(GL_POLYGON_OFFSET_FILL);
    glDisableClientState(GL_VERTEX_ARRAY);
    glDisableClientState(GL_NORMAL_ARRAY);
  }
}

/**
 * Polyhedron is a class to create a polyhedron gives faces, normals and vertices.
 * It mainly is designed to work with polyhedra.js and can draw any polyhedron geometry
 * given the parameters follow the same structure used in polyhedra.js
 *
 * @faces - 2D array of vertex indices for each face
 * @vetices - 2D array of vertices
 * @normals - 2D array of normal values
 */
class Polyhedron extends SceneGraphNode {
  constructor(faces, vertices, normals) {
    super();
    this.faces = faces;
    this.vertices = vertices;
    this.normals = normals;
    this.faceCoords = [];
    this.normalCoords = [];
    this.generateCoords();
  }
  //method to generate the face and normal coordinates using a 2D array of vertices, faces, and normals
  generateCoords() {
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i];
      for (let j = 0; j < face.length - 1; j++) {
        let start = this.faces[i][0];
        let vertex = this.faces[i][j];
        let last = this.faces[i][j + 1];

        this.faceCoords.push(
          this.vertices[start][0], this.vertices[start][1], this.vertices[start][2],
          this.vertices[vertex][0], this.vertices[vertex][1], this.vertices[vertex][2],
          this.vertices[last][0], this.vertices[last][1], this.vertices[last][2]
        );

        this.normalCoords.push(this.normals[i][0]);
        this.normalCoords.push(this.normals[i][1]);
        this.normalCoords.push(this.normals[i][2]);

        this.normalCoords.push(this.normals[i][0]);
        this.normalCoords.push(this.normals[i][1]);
        this.normalCoords.push(this.normals[i][2]);

        this.normalCoords.push(this.normals[i][0]);
        this.normalCoords.push(this.normals[i][1]);
        this.normalCoords.push(this.normals[i][2]);
      }
    }
  }
  doDraw() {
    //set the coordinate arrays to Float32Arrays
    this.normalCoords = new Float32Array(this.normalCoords);
    this.faceCoords = new Float32Array(this.faceCoords);
    this.colors = new Float32Array(this.colors);

    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_NORMAL_ARRAY);
    glScalef(3, 3, 3);
    glColor3f(this.r, this.g, this.b);
    glVertexPointer(3, GL_FLOAT, 0, this.faceCoords);
    glNormalPointer(GL_FLOAT, 0, this.normalCoords);
    glPolygonOffset(1, 1);
    glEnable(GL_POLYGON_OFFSET_FILL);
    glDrawArrays(GL_TRIANGLES, 0, this.faceCoords.length / 3);
    glDisable(GL_POLYGON_OFFSET_FILL);
    glDisableClientState(GL_VERTEX_ARRAY);
    glDisableClientState(GL_NORMAL_ARRAY);
  }
}

/**
 * TransformedObject represents a node in the scene graph that can apply a
 * tranformation to an object in the scene, supported transformations are
 * currently: rotation, scaling, and translation
 *
 * @object - Object to apply the transformation to
 */
class TransformedObject extends SceneGraphNode {
  constructor(object) {
    super();
    this.object = object;
    this.object.parent = this;
    this.rotationInDegrees = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.rotateX = 0;
    this.rotateY = 0;
    this.rotateZ = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.translateZ = 0;
  }
  clone(){
    let clone = super.clone();
    clone.object = this.object.clone();
    clone.object.parent = this;
    clone.rotationInDegrees = this.rotationInDegrees;
    clone.scaleX = this.scaleX;
    clone.scaleY = this.scaleY;
    clone.scaleZ = this.scaleZ;
    clone.translateX = this.translateX;
    clone.translateY = this.translateY;
    clone.translateZ = this.translateZ;
    return clone;
  }
  setRotation(angle, xAxis = 0, yAxis = 0, zAxis = 0) {
    this.rotationInDegrees = angle;
    this.rotateX = xAxis;
    this.rotateY = yAxis;
    this.rotateZ = zAxis;
    return this;
  }
  setScale(sx, sy = sx, sz = sx) {
    this.scaleX = sx;
    this.scaleY = sy;
    this.scaleZ = sz;
    return this;
  }
  setTranslation(dx, dy, dz) {
    this.translateX = dx;
    this.translateY = dy;
    this.translateZ = dz;
    return this;
  }
  doDraw() {
    glPushMatrix();
    if (this.translateX != 0 || this.translateY != 0 || this.translateZ != 0) {
      glTranslated(this.translateX, this.translateY, this.translateZ);
    }
    if (this.scaleX != 1 || this.scaleY != 1 || this.scaleZ != 1) {
      glScaled(this.scaleX, this.scaleY, this.scaleZ);
    }
    if (this.rotationInDegrees != 0) {
      glRotated(this.rotationInDegrees, this.rotateZ, this.rotateY, this.rotateX);
    }
    this.object.draw();
    glPopMatrix();
  }
}

/**
 * has the same problem whether this extends SceneGraphNode or TransformedObject
 */
class CameraNode extends SceneGraphNode{
  constructor(object) {
    super();
    this.object = object;
    this.camera = this.object;
    this.camera.setScale(10);
    this.camera.lookAt(0, 0, -20);
    this.camera.installTrackball(display);
  }
  doDraw() {
      let obj = this.parent; //get parent
      while(obj != null){  //used to be obj.parent != null but this also did not work
        console.log(obj); //for some reason this is CompoundObject and not TransformedObject
        //should do the inverse of parent translates
        glTranslated(-obj.translateX, -obj.translateY, -obj.translateZ);
        obj =obj.parent; //go up scene graph
      }
     //glTranslated(5,0,0);  //this works without the above, its a problem with parents
     //not with camera translate
  }
  draw(){
    //have to pop matrix so that it applies to the entire scene
    glPopMatrix();
    this.doDraw();
    glPushMatrix();
  }
  apply(){
    this.camera.apply();
  }
}

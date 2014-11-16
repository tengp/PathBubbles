/**
 * Created by Yongnan on 6/21/2014.
 */

PlaneGeometry = function ( p1, p2, planeName ) {

    //    2              3  (p2)
    //    |-------------|
    //    |             |
    //    |-------------|
    //    1 (p1)        4
    THREE.Geometry.call( this );
    if(planeName === "XY") {
        var normal = new THREE.Vector4(0, 0, 1, 0 );
        var uv1 = new THREE.Vector2(0,0);
        var uv2 = new THREE.Vector2(0,1);
        var uv3 = new THREE.Vector2(1,1);
        var uv4 = new THREE.Vector2(1,0);
        this.vertices.push( new THREE.Vector3(p1.x, p1.y, 0));
        this.vertices.push( new THREE.Vector3(p1.x, p2.y, 0));
        this.vertices.push( new THREE.Vector3(p2.x, p2.y, 0));
        this.vertices.push( new THREE.Vector3(p2.x, p1.y, 0));
        var face = new THREE.Face3( 0, 1, 2 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );
        face = new THREE.Face3( 2, 3, 0 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [uv3.clone(), uv4, uv1.clone()  ] );
    }
    else if(planeName === "YZ"){
        var normal = new THREE.Vector4(-1, 0, 0, 0 );
        var uv1 = new THREE.Vector2(0,0);
        var uv2 = new THREE.Vector2(1,0);
        var uv3 = new THREE.Vector2(1,1);
        var uv4 = new THREE.Vector2(0,1);
        this.vertices.push( new THREE.Vector3(0, p1.y, p1.z));
        this.vertices.push( new THREE.Vector3(0, p2.y, p1.z));
        this.vertices.push( new THREE.Vector3(0, p2.y, p2.z));
        this.vertices.push( new THREE.Vector3(0, p1.y, p2.z));

        var face = new THREE.Face3( 0, 1, 2 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );
        face = new THREE.Face3( 2, 3, 0 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uv3.clone(), uv4, uv1.clone() ] );
    }
    else if(planeName === "XZ"){
        var normal = new THREE.Vector4(0, 1, 0, 0 );
        var uv1 = new THREE.Vector2(0,0);
        var uv2 = new THREE.Vector2(0,1);
        var uv3 = new THREE.Vector2(1,1);
        var uv4 = new THREE.Vector2(1,0);
        this.vertices.push( new THREE.Vector3(p1.x, 0, p2.z));
        this.vertices.push( new THREE.Vector3(p1.x, 0, p1.z));
        this.vertices.push( new THREE.Vector3(p2.x, 0, p1.z));
        this.vertices.push( new THREE.Vector3(p2.x, 0, p2.z));
        var face = new THREE.Face3( 0, 1, 2 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );
        face = new THREE.Face3( 2, 3, 0 );
        face.normal.copy( normal );
        face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
        this.faces.push( face );
        this.faceVertexUvs[ 0 ].push( [ new THREE.Vector2(1,1), uv4, new THREE.Vector2(0,0) ] );
    }

    //this.computeCentroids();

};
PlaneGeometry.prototype = Object.create( THREE.Geometry.prototype );


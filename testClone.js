/**
 * 测试json对象的deepclone的耗时
 */

// let json = require('./samples/系统分析法.json');
let json = require('./samples/1024.json');



// console.log(json);
function deepClone (obj) { 
    if (obj === null || (typeof obj !== "object") ){ 
        return obj; 
    } 
    let target = Array.isArray(obj) ? [] : {}; 
    for (let name in obj) { 
        let value = obj[name]; 
        if ($.isFunction(value)) {
            target[name] = new Function(value.toString())();
        }
        else {
            target[name] = deepClone(value);

        }
    }　 
    return target;       
}

var _deepCloneRecursion = (obj, cloned, callback)=>{
    // deep first approach, loop each prop 
    // until the prop has no key/ not an obj

    var keys = Object.keys(obj);

    keys.forEach(key=>{
        var value = obj[key];
        callback && callback();
        if(value instanceof Object){
            // save parent node key
            cloned[key] = {};
            // pass the parent node to the next recursion
            _deepCloneRecursion(value, cloned[key],callback);
        }else{
            cloned[key] = value;
        }
    })

    return cloned;
}

var objOrigin = {
    "a":{
        "b":"c",
        "d":"e",
        "f":{
            "g":"h"
        }
    },
    "A":{
        "B":"C"
    }
};

var clone = (obj, callback)=>{
    var cloned = {};
    res = _deepCloneRecursion(obj, cloned, callback);

    return res;
}

// var objCloned = clone(objOrigin);

// objOrigin.a.f.g = "x";
// objCloned.a.f.g = "y";

// console.log(objOrigin, objCloned);


let count = 0;

let copy = clone(json, ()=>{
    count++;
});

let start = new Date().getMilliseconds();
for(let i=0;i<100;i++){
    copy = clone(json);
}
let end = new Date().getMilliseconds();

let dur = end - start;



console.log('count',count, dur/100, start, end, dur);
console.log('end')
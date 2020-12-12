function insertInsert(o1, o2){
    //o1 o2都为insert op的clone
    if(o1.rSiblingID == o2.rSiblingID 
        && o1.path == o2.path){
        if(o1 == MaxTS(o1, o2)){
            // o1是较晚的操作
            o2.rSiblingID = o1.node.id;
        }
        else{
            // o2是较晚的操作
            o1.rSiblingID = o2.node.id;
        }     
    }
    return {o1, o2}
}
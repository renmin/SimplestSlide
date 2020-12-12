function insertMove(o1, o2){
    //o1为insert，o2为move
    if(isAncestorOrSame(o2.oldPath, o1.path)){
        // o1 的目标被移动了，更新o1的目标
        o1.path = merge(o2.newPath,o2.oldPath.last(), o1.path)    
    }
    else if(o1.rSiblingID == o2.newRSiblingID 
        && o1.path == o2.newPath)
    {
        if(o1 == MaxTS(o1, o2)){
            // o1是较晚的操作
            o2.newRSiblingID = o1.node.id;
        }
        else{
            // o2是较晚的操作
            o1.rSiblingID = o2.oldPath.last();
        }     
    }
    else if(o1.rSiblingID == o2.oldPath.last()
        && o1.path == o2.oldPath){
        //插入的参照物被移动，用参照物的old参照物。
        o1.rSiblingID = o2.oldRSiblingID
    }
    else{

    }
    return {o1, o2}
}
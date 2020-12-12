
// 此处规定o1是经过仲裁后较早的op，o2较晚的op
function moveMove(o1, o2) {
    if (o1.newPath == o2.newPath
        && o1.newRSiblingID == o2.newRSiblingID) {
        // 目标位置相同，顺序不同, 需OT, 以后者为准
        o1.newRSiblingID = o2.id;
    }
    else {
        if (o1.id == o2.id) {
            // 移动同一个对象, 到不同容器，注1⃣️
            // 位置不同，先移动的生效，后者移动无效
            // ⚠️应该打回o2所在的整个delta
            return {
                type: 'reject',
                op: { o2 },
            };
        }
        else if (o2.newPath.indexOf(o1.id) > -1
            && o1.newPath.indexOf(o2.id) > -1) {
            // 成环，只能有一个操作生效
            // ⚠️应该打回o2所在的整个delta
            return {
                type: 'reject',
                op: { o2 },
            };
        }
        else if (o1.newPath.indexOf(o2.id) > -1) {
            // o1 的目标被移动了，更新o1的目标
            o1.newPath = merge(o2.newPath, o2.id, o1.newPath)
        }
        else if (o2.newPath.indexOf(o1.id) > -1) {
            // o2 的目标被移动了，更新o2的目标
            o2.newPath = merge(o1.newPath, o1.id, o2.newPath)
        }
        else if (o1.oldPath.indexOf(o2.id) > -1) {
            // o1 原来的位置被移动了，更新o1的原位置
            o1.oldPath = merge(o2.newPath, o2.id, o1.oldPath)
        }
        else if (o2.oldPath.indexOf(o1.id) > -1) {
            // o2 原来的位置被移动了，更新o2的原位置
            o2.oldPath = merge(o1.newPath, o1.id, o2.oldPath)
        }
        else {
            if (o2.id == o1.newRSiblingID) {
                // 参照物被移动，需要OT，用参照物原位置的参照物
                o1.newRSiblingID = o2.oldRSiblingID
            }
            if (o1.id == o2.newRSiblingID) {
                // 参照物被内部移动，需要OT，用参照物原位置的参照物
                o2.newRSiblingID = o1.oldRSiblingID
            }
            if (o2.id == o1.oldRSiblingID) {
                // old参照物被内部移动，需要OT，用参照物原位置的参照物
                o1.oldRSiblingID = o2.oldRSiblingID
            }
            if (o1.id == o2.oldBeforeId) {
                // old参照物被内部移动，需要OT，用参照物原位置的参照物
                o2.oldRSiblingID = o1.oldRSiblingID
            }
            // 其他情况，不需要OT
        }
    }
    return {
        type: 'apply',
        op: { o1, o2 },
    };
}
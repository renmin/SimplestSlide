var test = function(list){
    let result = [list[0]]
    for(let i = 1; i< list.length; i++){
      let temp = list[i]
      for(let j = 0;j<result.length; j++){
        if(temp[0]>=result[j][0] && temp[0]<=result[j][1] && temp[1]>result[j][1]){
          result[j][1] = temp[1]
          break
        } else if (temp[1]>=result[j][0] && temp[1]<=result[j][1] && temp[0]<result[j][0]){
          result[j][0] = temp[0]
          break
        } else if (temp[0]>result[j][1] || temp[1]<result[j][0]){
          result.push(temp)
          break
        }
      }
    }
    return result
  }
  console.log(test([[1,6],[2,3],[15,18],[8,10],[10,11],[7,8]]));

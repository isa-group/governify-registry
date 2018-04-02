var df = require("deep-diff");

var item =  {
  "scope": {
    "activity": "1.1. Actividad de incidencias",
    "serviceLine": "1. Linea servicio de mantenimiento básico"
  },
  "period": {
    "from": "20160516",
    "to": "20160615"
  },
  "penalty": "porcentajePTOT"
};

var array = [
  {
    "scope": {
      "activity": "1.1. Actividad de incidencias",
      "serviceLine": "1. Linea servicio de mantenimiento básico"
    },
    "period": {
      "from": "20160516",
      "to": "20160615"
    },
    "penalty": "porcentajePTOT"
  },
  {
    "scope": {
      "activity": "1.1. Actividad de incidencias",
      "serviceLine": "1. Linea servicio de mantenimiento básico"
    },
    "period": {
      "from": "20160416",
      "to": "20160515"
    },
    "penalty": "porcentajePTOT"
  },
  {
    "scope": {
      "activity": "1.1. Actividad de incidencias",
      "serviceLine": "1. Linea servicio de mantenimiento básico"
    },
    "period": {
      "from": "20160516",
      "to": "20160615"
    },
    "penalty": "porcentajePTOT"
  }
];

item = {c:"xxxx",a:"kkkk"};
array = [{a:"kkkk",c:"xxxx"},{a:"luis"},{a:"kkkk"}]

function containsObject(obj, array) {
    var i;
    //console.log("obj: "+JSON.stringify(obj,null,2));
    for (i = 0; i < array.length; i++) {
        if (df(list[i],obj) == null) {
            return i;
        }
    }

    return -1;
}

//console.log(JSON.stringify(array,null,2));
//console.log(JSON.stringify(item,null,2));
console.log(containsObject(item, array));

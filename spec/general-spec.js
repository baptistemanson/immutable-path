'use strict';

var immupath = require('./../src/index.js');

describe('yo', () => {
    it('first test', () => {
        let obj = {
            level1: {
                level2: {
                    level3: 3
                },
                level2bis: [{
                    id:1,
                    val:1
                }, {id:2, val:2}]
            }
        };

        console.log(JSON.stringify(immupath.pathWithTable(obj,['level1','level2','level3'], x => x+1)));

        console.log(JSON.stringify(immupath.pathWithTable(obj,['level1','level2bis','[id=1]','val'], x => x+1)));
        console.log(JSON.stringify(immupath.path(obj,'level1.level2bis[id=1],val', x => x+100) ));

    });
    it('parses path', () => {
        //console.log(immupath.parsePath('level1.level2[key=val].level3[key2=val2].level4'));

    });
});
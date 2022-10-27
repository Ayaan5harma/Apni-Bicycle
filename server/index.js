const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;
const bicyclesdata = require('./data/data.json');

const replacetempalate =(data,bicycle)=>{

    data = data.replace(/<%image%>/g,bicycle.image);
    data = data.replace(/<%name%>/g,bicycle.name);
    let price = bicycle.originalPrice;
    if(bicycle.hasDiscount)
    {
        data = data.replace(/<%discountrate%>/g,`<div class="discount_rate"><p>${bicycle.discount}% off</p></div>`)
     price = (price*(100-bicycle.discount)/100);
     
    }
    else{
        data = data.replace(/<%discountrate%>/g,``)
      
    }
    data = data.replace(/<%id%>/g,bicycle.id);
    data = data.replace(/<%oldprice%>/g,bicycle.originalPrice)
     data = data.replace(/<%newprice%>/g,`${price}`);
    
    for(let idx =0;idx<bicycle.star;idx++)
    {
        data = data.replace(/<%star%>/,'checked'); 
    }
    data = data.replace(/<%star%>/,''); 
    return data;
}  

const server = http.createServer(async (req,res)=>{

    const customhost = req.headers.host;
    // console.log(customhost);
     
    const myurl = new URL(req.url,`http://${customhost}/`);
     const id =myurl.searchParams.get('id');
     const pathname = myurl.pathname;
    //    console.log(req.url);
    if(pathname==='/')
    {
        
        
        let data = await fs.readFile('./index.html','utf-8');

        let carddata = await fs.readFile('./card.html','utf-8');
       
          let allcycles ='';
        for(let idx =0;idx<6;idx++)
        {
            
            allcycles+=replacetempalate(carddata,bicyclesdata[idx]);

        }
     data = data.replace('<%allbicylces%>',allcycles);
        res.writeHead(200,{'content-Type':'text/HTML'});
        res.end(data);

        

    }
    else if(pathname==='/bicycle' && id>=0 && id<=5)
    {
        let data = await fs.readFile('./overview.html','utf-8');
        
           const bicycle = bicyclesdata.find((b)=>b.id===id);

        data = replacetempalate(data,bicycle);

       res.writeHead(200,{'content-Type':'text/HTML'});
        res.end(data);
    }
    else if(pathname==='/index.css')
    {
        const css = await fs.readFile('./css/index.css','utf-8');
       res.writeHead(200,{'content-Type':'text/CSS'});
        res.end(css);
    }
    else if(/\.(png)$/i.test(req.url))
    {
         const image =  await fs.readFile(`./images/${req.url.slice(1)}`);
         res.writeHead(200,{'content-Type':'image/png'});
          res.end(image);
    }
    else if(/\.(svg)$/i.test(req.url))
    {
         const svg =  await fs.readFile(`./images/icons.svg`);
         res.writeHead(200,{'content-Type':'image/svg+xml'});
          res.end(svg);
    }
    
    else{
        res.end('<h1>Error, no page found</h1>');
    }

   
})

server.listen(8000,()=>{
    console.log("listening to the port ");
})

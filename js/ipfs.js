ipfs = window.IpfsHttpClient.create({
  host: "ipfs.infura.io",
  port: "5001",
});

async function uploadToIpfs(content) {
  let res = await ipfs.add(content);
  console.log(res);
  return res["cid"];
}

async function catFromIpfs(cid) {
  let contents = "";
  let source = ipfs.cat(cid);
  const decoder = new TextDecoder("utf-8");

  for await (const chunk of source) {
    contents += decoder.decode(chunk, {
      stream: true,
    });
  }

  contents += decoder.decode();
  return contents;
}

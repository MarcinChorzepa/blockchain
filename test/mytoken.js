var MyToken = artifacts.require("./MyToken.sol");

contract("MyToken", function (accounts) {
    var tokenInstancce;

    it("token name", function () {
        return MyToken.deployed().then(function (instnce) {
            tokenInstancce = instnce;
            return tokenInstancce.name();
        }).then(function (name) {
            assert.equal(name, "SecretService", "token name is correct");
            return tokenInstancce.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, "ss", "symbol is correct");
        });
    });

    it("initializes MyToken", function () {
        return MyToken.deployed().then(function (instance) {
            tokenInstancce = instance
            return tokenInstancce.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply, 1000000, 'Initial total supply 1 M');
            return tokenInstancce.balanceOf(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance, 1000000, 'balance of init admin account is 1M');
        });
    });

    it("transfer  MyToken ownership", function () {
        return MyToken.deployed().then(function (instance) {
            tokenInstancce = instance
            return tokenInstancce.transfer.call(accounts[1], 999999999999);
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstancce.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function (recipt) {
            assert.equal(recipt, true, 'transfer success');
            return tokenInstancce.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'there is an event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'right name of an event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'right from account');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'right to account');
            assert.equal(receipt.logs[0].args._value, 250000, 'right value');

            return tokenInstancce.balanceOf(accounts[1]);
        }).then(function (balcnce) {
            assert.equal(balcnce.toNumber(), 250000, 'adds transfered ammount');
            return tokenInstancce.balanceOf(accounts[0]);

        }).then(function (balance) {
            assert.equal(balance.toNumber(), 750000, 'decrease value');
        });
    });

    it("approves MyToken delegate transfer", function () {
        return MyToken.deployed().then(function (instance) {
            tokenInstancce = instance
            return tokenInstancce.approve.call(accounts[1], 100);
        }).then(function (success) {
            assert.equal(success, true, 'approve success');
            return tokenInstancce.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'there is an event');
            assert.equal(receipt.logs[0].event, 'Approval', 'there is an event name');
            assert.equal(receipt.logs[0].args._ovner, accounts[0], 'right from account');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'right to account');
            assert.equal(receipt.logs[0].args._value, 100, 'right value');
            return tokenInstancce.allowance(accounts[0], accounts[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, 'allowence ammount correct');
        });
    });

    it("transferFrom", function () {
        return MyToken.deployed().then(function (instance) {
            tokenInstancce = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendigAccount = accounts[4];
            return tokenInstancce.transfer(fromAccount, 100,{from: accounts[0]});
        }).then(function (receipt) {
            return tokenInstancce.approve(spendigAccount,10, {from: fromAccount});
        }).then(function (receipt) {
            return tokenInstancce.transferFrom(fromAccount, toAccount, 9999,{from:spendigAccount});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert')>=0,'cannot spend more then it has on account')
       return tokenInstancce.transferFrom(fromAccount,toAccount,20,{from: spendigAccount});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert')>=0,'cannot spend more then it has allowence')
            return tokenInstancce.transferFrom.call(fromAccount,toAccount,10,{from: spendigAccount});
        }).then(function (success) {
            assert.equal(success,true,'passed')
            return tokenInstancce.transferFrom(fromAccount,toAccount,10,{from: spendigAccount});
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'there is an event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'right name of an event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'right from account');
            assert.equal(receipt.logs[0].args._to, toAccount, 'right to account');
            assert.equal(receipt.logs[0].args._value, 10, 'right value');
            return tokenInstancce.balanceOf(fromAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(),90,'from account has lower value');
            return tokenInstancce.balanceOf(toAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(),10,'to account has bigger value');
            return tokenInstancce.allowance(fromAccount,spendigAccount);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(),0,'allowence adjusted');
        });
    });

});
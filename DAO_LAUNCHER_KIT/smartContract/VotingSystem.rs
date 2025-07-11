use std::io;
// #[derive(Debug)]

//      take number as input
//     let mut number = String::new();
//     println!("Enter the number : ");
//     io::stdin().read_line(&mut number).expect("Failed");
//     let num :i32 = number.trim().parse().expect("Enter the number");

// use std::io::{self, Write};

struct Account {
    name: String,
    balance: f64,
}

enum TransactionType {
    Deposit(f64),
    Withdraw(f64),
    CheckBalance,
}

impl Account {
    fn process_transaction(&mut self, tx: TransactionType) {
        match tx {
            TransactionType::CheckBalance => {
                println!("Available balance : {}", self.balance);
            }

            TransactionType::Deposit(money) => {
                self.balance += money;
                println!("Available balance after deposit: {}", self.balance);

            }

            TransactionType::Withdraw(money) => {
                self.balance -= money;
                println!("Available balance after withdraw : {}", self.balance);
            }
        }
    }
}

fn main() {
    let mut name = String::new();
    println!("Enter name: ");
    // io::stdout().flush().unwrap(); // Flush the output to display prompt immediately
    io::stdin().read_line(&mut name).expect("Failed");
    name = name.trim().to_string();

    let mut balance = String::new();
    println!("Enter balance: ");
    // io::stdout().flush().unwrap();
    io::stdin().read_line(&mut balance).expect("Failed");
    let balance: f64 = balance.trim().parse().expect("Failed");

    let mut user = Account { name, balance };

    let mut tx = TransactionType::Deposit(18990.0);
    user.process_transaction(tx);


    tx = TransactionType::Withdraw(1990.0);
    user.process_transaction(tx);

    tx = TransactionType::CheckBalance;
    user.process_transaction(tx);

}


import React, { useState, useEffect } from "react";
import fetch from './api/rewardsData';
import "./App.css";

function calculateResults(incomingData) {
  // Calculate points per transaction

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = incomingData.map(transaction => {
    let points = 0;
    let amountOver100 = transaction.amt - 100;

    if (amountOver100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction      
      points += (amountOver100 * 2);
    }
    if (transaction.amt > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let { cusId, name, month, points } = pointsPerTransaction;
    if (!byCustomer[cusId]) {
      byCustomer[cusId] = [];
    }
    if (!totalPointsByCustomer[cusId]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[cusId][month]) {
      byCustomer[cusId][month].points += points;
      byCustomer[cusId][month].monthNumber = month;
      byCustomer[cusId][month].numTransactions++;
    }
    else {

      byCustomer[cusId][month] = {
        cusId,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      }
    }
  });
  let tot = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach(cRow => {
      tot.push(cRow);
    });
  }
  console.log("byCustomer", byCustomer);
  console.log("tot", tot);
  return {
    summaryByCustomer: tot,
    pointsPerTransaction
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  useEffect(() => {
    fetch().then((data) => {
      const results = calculateResults(data);
      setTransactionData(results);
      console.log('results', results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return transactionData == null ?
    <div>Loading...</div>
    :
    <div>

      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Rewards for Each Transaction By Customers</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <table>
              <tbody>
                <tr>
                  <th>Customer</th>
                  <th>Transaction Date</th>
                  <th>Amount</th>
                  <th>Reward Points</th>
                </tr>
                {transactionData.pointsPerTransaction.map((val, key) => {
                  return (
                    <tr style={{ textAlign: 'center' }} key={key}>
                      <td>{val.name}</td>
                      <td>{val.transactionDt}</td>
                      <td>{val.amt}</td>
                      <td>{val.points}</td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Rewards for Each month By Customer</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <table>
              <tbody>
                <tr>
                  <th>Customer</th>
                  <th>Month</th>
                  <th>Reward Points</th>
                </tr>
                {transactionData.summaryByCustomer.map((val, key) => {
                  return (
                    <tr style={{ textAlign: 'center' }} key={key}>
                      <td>{val.name}</td>
                      <td>{val.month}</td>
                      <td>{val.points}</td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    ;
}

export default App;

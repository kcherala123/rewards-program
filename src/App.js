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

  let byEachCustomer = {};
  let totalRewardPoints = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let { cusId, name, month, points } = pointsPerTransaction;
    if (!byEachCustomer[cusId]) {
      byEachCustomer[cusId] = [];
    }
    if (!totalRewardPoints[cusId]) {
      totalRewardPoints[name] = 0;
    }
    totalRewardPoints[name] += points;
    if (byEachCustomer[cusId][month]) {
      byEachCustomer[cusId][month].points += points;
      byEachCustomer[cusId][month].monthNumber = month;
      byEachCustomer[cusId][month].numTransactions++;
    }
    else {

      byEachCustomer[cusId][month] = {
        cusId,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      }
    }
  });
  let totalPointsForEachMonth = [];
  for (var custKey in byEachCustomer) {
    byEachCustomer[custKey].forEach(cRow => {
      totalPointsForEachMonth.push(cRow);
    });
  }
  console.log("byEachCustomer", byEachCustomer);
  console.log("total points", totalPointsForEachMonth);
  return {
    summaryByCustomer: totalPointsForEachMonth,
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

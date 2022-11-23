import axios from "axios";
import fs from "fs";
import _ from "lodash";
import moment from "moment";

const f = "YYYYMMDD";

function saveData(date) {
  return axios({
    responseType: "stream",
    url: `http://www.twse.com.tw/exchangeReport/MI_INDEX?response=csv&date=${date}&type=ALLBUT0999`,
  }).then((resp) => {
    resp.data.pipe(fs.createWriteStream(`./csv/${date}.csv`));
    delTodayEmpty(date)
  });
}

function getDateList(startDate) {
  const _startDate = moment(startDate);
  const _endDate = moment();
  const ary = [_startDate.format(f)];
  let current;
  while (current !== _endDate.format(f)) {
    current = _startDate.add(1, "d").format(f);
    ary.push(current);
  }
  return ary;
}

function save10YearCsv() {
  const dateList = getDateList("20100101");
  let index = 0;
  const cb = () => {
    const val = dateList[index];
    if (!val) return;
    console.log(`load ${val}`);
    if (fs.existsSync(`./csv/${val}.csv`)) {
      index += 1
      return cb();
    }

    saveData(val).then(() => {
      index += 1;
      setTimeout(cb, 5000);
    });
  };
  cb();
}

function delTodayEmpty(date){
  try {
    if(date === moment().format(f)){
      const data = fs.readFileSync(`./csv/${date}.csv`, null)
      if(!data.toString()){
        fs.unlinkSync(`./csv/${date}.csv`)
      }
    }
  } catch (error) {
    setTimeout(delTodayEmpty,1000,date)
  }

}

save10YearCsv();

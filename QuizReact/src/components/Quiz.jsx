import React, { useEffect, useState } from 'react'
import { BASE_URL, ENDPOINT, createAPIEndpoint } from '../api'
import { Card , CardHeader , CardContent, List, ListItemButton, Typography, Box, LinearProgress, CardMedia } from '@mui/material'
import { getFormatedTime } from '../helper';
import useStateContext from '../hooks/useStateContext';
import { useNavigate } from 'react-router-dom';

export default function Quiz() {


  const [qns, setQns] = useState([]);
  const [qnIndex, setQnIndex] = useState(0)
  const [timeTaken, setTimetaken] = useState(0)
  const {context, setContext} = useStateContext()
  const navigate = useNavigate()
  let timer;


  const startTimer = () => {
    timer = setInterval(()=> {
      setTimetaken(prev => prev +1)
    },[1000])
  }


  const updateAnswer = (qnId,optionIdx) => {
    const temp = [...context.selectedOptions]
    temp.push({
      qnId,
      selected : optionIdx
    })

    setContext({selectedOptions : [...temp]})
    setQnIndex(qnIndex+1)

    if(qnIndex<4){
      setContext({ selectedOptions: [...temp] })
      setQnIndex(qnIndex + 1)
    }
    else{
        setContext({ selectedOptions: [...temp],timeTaken })
        //navigate result component
        navigate("/result")
    }

  }

  useEffect(()=>{

    setContext({
      timeTaken : 0,
      selectedOptions:[]
    })

    createAPIEndpoint(ENDPOINT.question)
    .fetch()
    .then(res => {
      setQns(res.data)
      startTimer()
    })
    .catch(err => {console.log(err);})

    return () => { clearInterval(timer) }


},[])

  return (
    qns.length != 0
      ? <Card
      sx={{maxWidth:640,mx:'auto',mt:5,
        '& .MuiCardHeader-action': { m:0,alignSelf : 'center' }
      }}>
        <Box>
        <LinearProgress variant="determinate" value={(qnIndex+1)*100/5} />
        </Box>
        {
          qns[qnIndex].imageName != null
            ? <CardMedia component={"img"}
            image={BASE_URL+'images/' + qns[qnIndex].imageName} 
            sx={{ width:'auto',m:'10px auto' }}/>
            : null 
        }
        
        <CardHeader title={'Question ' + (qnIndex+1) + ' of 5 '} 
          action={<Typography>{getFormatedTime(timeTaken)}</Typography>}
        />
        <CardContent>
          <Typography variant='h6'>
              {qns[qnIndex].qnInWords}
          </Typography>

          <List>

            {qns[qnIndex].options.map((item,idx)=>
              <ListItemButton key={idx} onClick={()=>updateAnswer(qns[qnIndex].qnId,idx)}
              disableRipple>
                <div>
                  <b>{String.fromCharCode(65 + idx)+" . "}</b>{item}
                </div>
              </ListItemButton>
            )}
            <ListItemButton>


            </ListItemButton>
          </List>

        </CardContent>
      </Card>
      : null
  )
}
